import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">AADSS 🚀</h1>
      <br />
      <div className="flex h-screen items-center justify-center">
        <Button className="bg-red-500 hover:bg-red-600 cursor-pointer">
          Test Button
        </Button>
      </div>
    </div>
  );
}
