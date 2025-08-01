import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  try {
    const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id);

    if (!usuario) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Usuário encontrado",
      usuario,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao buscar usuário" }, { status: 500 });
  }
}
