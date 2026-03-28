"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase'; // Adjust path if needed
import { FaPlus, FaTrash, FaUserTie, FaMicrophone, FaPenNib } from 'react-icons/fa';

interface Artist {
  id: string;
  name_hinglish: string;
  name_hindi: string;
}

interface LinkedArtist {
  id: string; // The ID of the mapping row (or temp id for Add Mode)
  role: string;
  artists: Artist;
  artist_id?: string; // Used specifically for Add Mode removal
}

// 🌟 UPDATED: Interface now supports both Add and Edit modes
interface BhajanArtistManagerProps {
  bhajanId?: string; // Optional: Only present in Edit Mode
  selectedArtists?: { artist_id: string; role: string }[]; // Optional: For Add Mode
  onChange?: (artists: { artist_id: string; role: string }[]) => void; // Optional: For Add Mode
}

export default function BhajanArtistManager({ bhajanId, selectedArtists, onChange }: BhajanArtistManagerProps) {
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [linkedArtists, setLinkedArtists] = useState<LinkedArtist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Singer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Artists & Current Mappings on mount
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bhajanId]);

  const fetchData = async () => {
    // 1. ALWAYS Fetch all available artists for the dropdown
    const { data: artistsData } = await supabase
      .from('artists')
      .select('id, name_hinglish, name_hindi')
      .order('name_hinglish', { ascending: true });
    
    if (artistsData) setAllArtists(artistsData);

    // 2. Fetch linked artists ONLY if bhajanId exists (Edit Mode)
    if (bhajanId) {
      const { data: linkedData } = await supabase
        .from('bhajan_artist_map')
        .select(`
          id,
          role,
          artists ( id, name_hinglish, name_hindi )
        `)
        .eq('bhajan_id', bhajanId);
      
      if (linkedData) setLinkedArtists(linkedData as unknown as LinkedArtist[]);
    }
  };

  const handleLinkArtist = async () => {
    if (!selectedArtistId) return alert("Please select an artist first.");
    
    // 🌟 EDIT MODE: Insert directly into Supabase
    if (bhajanId) {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('bhajan_artist_map')
        .insert([{ bhajan_id: bhajanId, artist_id: selectedArtistId, role: selectedRole }]);

      if (error) {
        if (error.code === '23505') {
          alert("This artist is already linked to this bhajan with this role!");
        } else {
          alert("Error linking artist: " + error.message);
        }
      } else {
        await fetchData(); // Refresh list
        setSelectedArtistId(''); // Reset dropdown
      }
      setIsSubmitting(false);
    } 
    // 🌟 ADD MODE: Update Parent State
    else if (selectedArtists && onChange) {
      const isDuplicate = selectedArtists.some(a => a.artist_id === selectedArtistId && a.role === selectedRole);
      
      if (isDuplicate) {
        alert("This artist is already added with this role!");
        return;
      }

      onChange([...selectedArtists, { artist_id: selectedArtistId, role: selectedRole }]);
      setSelectedArtistId(''); // Reset dropdown
    }
  };

  const handleRemoveLink = async (mappingId: string, tempArtistId?: string, tempRole?: string) => {
    if (!confirm("Are you sure you want to remove this credit?")) return;

    // 🌟 EDIT MODE: Delete from Supabase
    if (bhajanId) {
      const { error } = await supabase
        .from('bhajan_artist_map')
        .delete()
        .eq('id', mappingId);

      if (error) {
        alert("Error removing artist: " + error.message);
      } else {
        setLinkedArtists(prev => prev.filter(a => a.id !== mappingId));
      }
    } 
    // 🌟 ADD MODE: Remove from Parent State
    else if (selectedArtists && onChange && tempArtistId && tempRole) {
      onChange(selectedArtists.filter(a => !(a.artist_id === tempArtistId && a.role === tempRole)));
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role.toLowerCase()) {
      case 'singer': return <FaMicrophone className="text-green-600" />;
      case 'lyricist': return <FaPenNib className="text-blue-600" />;
      default: return <FaUserTie className="text-gray-600" />;
    }
  };

  // Determine which list to display based on the mode
  const displayArtists: LinkedArtist[] = bhajanId 
    ? linkedArtists 
    : (selectedArtists || []).map((sa, index) => {
        const artistDetails = allArtists.find(a => a.id === sa.artist_id);
        return {
          id: `temp-${index}`, // Fake ID for React key mapping
          role: sa.role,
          artist_id: sa.artist_id,
          artists: artistDetails || { id: sa.artist_id, name_hinglish: 'Loading...', name_hindi: '...' }
        };
      });

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Manage Artists & Credits</h3>

      {/* --- ADD NEW MAPPING FORM --- */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
        
        {/* Artist Dropdown */}
        <select 
          className="flex-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          value={selectedArtistId}
          onChange={(e) => setSelectedArtistId(e.target.value)}
        >
          <option value="">-- Select an Artist --</option>
          {allArtists.map(artist => (
            <option key={artist.id} value={artist.id}>
              {artist.name_hinglish} ({artist.name_hindi})
            </option>
          ))}
        </select>

        {/* Role Dropdown */}
        <select 
          className="w-full md:w-40 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="Singer">Singer</option>
          <option value="Lyricist">Lyricist</option>
          <option value="Composer">Composer</option>
        </select>

        {/* Submit Button */}
        <button 
          onClick={handleLinkArtist}
          type="button" // Prevent standard form submission
          disabled={isSubmitting || !selectedArtistId}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <FaPlus /> {isSubmitting ? 'Adding...' : 'Add Credit'}
        </button>
      </div>

      {/* --- DISPLAY LINKED ARTISTS --- */}
      <div>
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Current Credits</h4>
        
        {displayArtists.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No artists linked to this bhajan yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayArtists.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-orange-300 transition-colors">
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    {getRoleIcon(link.role)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{link.artists.name_hinglish}</p>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{link.role}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleRemoveLink(link.id, link.artist_id, link.role)}
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 transition-colors"
                  title="Remove Credit"
                >
                  <FaTrash className="text-sm" />
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}