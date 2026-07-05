async function testApi() {
  const url = "http://localhost:3000/api/auth/me";
  console.log(`Fetching from: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`HTTP status: ${res.status}`);
    const text = await res.text();
    console.log("Raw response (first 500 chars):");
    console.log(text.substring(0, 500));
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
testApi();
