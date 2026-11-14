import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    message: "Admin account creation endpoint. Use Firebase Console or Auth SDK to register admin email/password.",
    instructions: [
      "1. Open Firebase Console -> Authentication -> Users",
      "2. Click 'Add User' and create admin credentials (e.g., admin@mahacet.org)",
      "3. Use these credentials on /admin/login"
    ]
  });
}
