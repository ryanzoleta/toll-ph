export async function GET() {
  return new Response(`google.com, pub-6227779501096169, DIRECT, f08c47fec0942fa0`.trim(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
