"use client";

export default function ClickaduBanner() {
  return (
    // 🌟 Reserving min-height prevents the page from jumping when the ad loads
    <div className="flex justify-center items-center w-full min-h-[250px] my-8 overflow-hidden rounded-xl bg-gray-50/50 border border-gray-100">
      
      {/* The exact Ad Spot div provided by Clickadu */}
      <div data-cl-spot="2148973"></div>
      
    </div>
  );
}