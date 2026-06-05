const test = async () => {
  try {
    const res = await fetch('https://dronweb.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: "You are a helpful assistant.",
        messages: [{ role: "user", content: "Hello" }]
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
};
test();
