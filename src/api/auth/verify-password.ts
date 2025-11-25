import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { plainPassword, hash } = await req.json();

    if (!plainPassword || !hash) {
      return new Response(
        JSON.stringify({ error: 'Missing password or hash' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const valid = await bcrypt.compare(plainPassword, hash);

    return new Response(
      JSON.stringify({ valid }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Password verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Password verification failed', valid: false }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
