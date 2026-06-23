type MarkProps = { size: number };

// The association badge (會徽), shared by the admin Logo (graphics slot) and
// Icon (avatar slot) so the image markup lives in one place.
export function Mark({ size }: MarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Payload admin logo slot (not a public LCP image); next/image is inappropriate here
    <img
      src="/images/logo.jpg"
      alt="香港開州同鄉會"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
    />
  );
}

export default function Logo() {
  return <Mark size={120} />;
}
