/* eslint-disable @next/next/no-img-element */

type PdpGalleryProps = {
  images: string[];
  productName: string;
};

export function PdpGallery({ images, productName }: PdpGalleryProps) {
  const [main, ...thumbs] = images;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-4xl border border-border bg-bg-elevated shadow-sm">
        <div className="aspect-square bg-bg-sunken">
          {main ? (
            <img src={main} alt={productName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-black text-primary">NT</div>
          )}
        </div>
      </div>

      {thumbs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {thumbs.slice(0, 3).map((image) => (
            <div key={image} className="overflow-hidden rounded-2xl border border-border bg-bg-elevated">
              <img src={image} alt={productName} className="aspect-square w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
