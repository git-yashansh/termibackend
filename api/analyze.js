export const config = {
  runtime: "edge"
};

export default function handler() {
  return new Response(
    JSON.stringify({ status: "BACKEND_OK" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
