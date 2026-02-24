import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;

  // Sanitize: only allow alphanumeric hashes
  if (!/^[a-f0-9]+$/.test(hash)) {
    return new NextResponse("Invalid hash", { status: 400 });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "audio",
    "cache",
    `${hash}.mp3`
  );

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.length),
      "Cache-Control": "public, max-age=604800",
    },
  });
}
