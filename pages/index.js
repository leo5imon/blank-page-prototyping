import dynamic from "next/dynamic";

const Base64Dynamic = dynamic(() => import("./components/Base64"), {
  ssr: false,
});

export default function CameraPage() {
  return (
    <div className="bg-white">
      <Base64Dynamic />
    </div>
  );
}
