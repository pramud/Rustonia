// src/app/api/execute/route.js
export async function POST(req) {
    const { code } = await req.json();
  
    const response = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
  
    const result = await response.text();
    return new Response(result, {
      status: 200,
    });
  }
  