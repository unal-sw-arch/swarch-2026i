import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // Ensure uploads dir exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.promises.mkdir(uploadsDir, { recursive: true });

  try {
    // Use Web Request formData() to read the uploaded file
    const formData = await req.formData();
    const file = formData.get('file') as unknown as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const arrayBuffer = await (file as any).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = `${Date.now()}-${(file as any).name?.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const dest = path.join(uploadsDir, safeName);
    await fs.promises.writeFile(dest, buffer);

    const url = `/uploads/${safeName}`;
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: 'upload error', message: err?.message || String(err) }, { status: 500 });
  }
}
