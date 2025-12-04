const API_URL = 'http://localhost:8000';

export async function calculateAll(state) {
    const response = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
    });

    if (!response.ok) {
        throw new Error('Calculation failed');
    }

    return response.json();
}

export async function fetchDefaults() {
    const response = await fetch(`${API_URL}/defaults`);
    if (!response.ok) {
        throw new Error('Failed to fetch defaults');
    }
    return response.json();
}
