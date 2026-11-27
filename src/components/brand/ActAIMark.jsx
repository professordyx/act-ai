import { Image } from "@/components/ui/image";

// Ícone do Act AI: símbolo de áudio branco sobre quadrado verde-petróleo.
export const APP_ICON_URL = "https://media.base44.com/images/public/6b088e07a957e059fd862425/58e6a03525e06b00f1f4648b253f1f22_generated_image.png";

export default function ActAIMark({ className = "h-8 w-8" }) {
  return <Image src={APP_ICON_URL} alt="Act AI" fittingType="fit" className={`shrink-0 rounded-[22%] object-contain ${className}`} />;
}