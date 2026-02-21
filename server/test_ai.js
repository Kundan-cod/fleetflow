import fetch from 'node-fetch';

async function testAI() {
    try {
        const res = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'hi' })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

testAI();
