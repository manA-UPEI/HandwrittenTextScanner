import { transcribeImageAction } from "@/presentation/actions/transcribe-image.action";
import { ScannerScreen } from "@/presentation/components/scanner-screen";

export default function Home() {
  return <ScannerScreen transcribe={transcribeImageAction} />;
}
