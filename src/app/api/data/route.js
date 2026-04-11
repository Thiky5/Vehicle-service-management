/* global process, URL */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const JSONBIN_URL = "https://api.jsonbin.io/v3/b";
const LOCAL_SERVER_URL = "http://127.0.0.1:3001";
const API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;

// Helper to get data from local json-server if available
async function getLocalServerData(collection, id) {
  try {
    const url = id ? `${LOCAL_SERVER_URL}/${collection}/${id}` : `${LOCAL_SERVER_URL}/${collection}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(500) }); // Quick check
    if (res.ok) return await res.json();
  } catch (err) {
    return null; // Local server is probably down
  }
  return null;
}

// Helper to fetch the entire bin (with local file fallback)
async function getFullData() {
  if (!API_KEY || !BIN_ID) {
    try {
      const filePath = path.join(process.cwd(), "db.json");
      const fileData = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileData);
    } catch (err) {
      return { vehicles: [], customers: [], serviceAdvisors: [], workItems: [] };
    }
  }

  const res = await fetch(`${JSONBIN_URL}/${BIN_ID}`, {
    headers: { "X-Master-Key": API_KEY, "X-Bin-Meta": "false" },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to fetch from JSONBin");
  return res.json();
}

// Helper to save data (only if JSONBin is configured)
async function saveFullData(data) {
  if (!API_KEY || !BIN_ID) return data;

  const res = await fetch(`${JSONBIN_URL}/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save to JSONBin");
  return res.json();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");

  // 1. Try local server first (silent)
  if (collection) {
    const localData = await getLocalServerData(collection, id);
    if (localData) return NextResponse.json(localData);
  }

  // 2. Fallback to File/Online
  try {
    const data = await getFullData();
    if (collection) {
      const items = data[collection] || [];
      if (id) {
        const item = items.find(i => String(i.id) === String(id));
        return item ? NextResponse.json(item) : NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      return NextResponse.json(items);
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const body = await request.json();

  // Try local server first
  try {
    const res = await fetch(`${LOCAL_SERVER_URL}/${collection}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(500)
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (err) { /* Silent fail to fallback */ }

  try {
    const data = await getFullData();
    const items = data[collection] || [];
    items.push(body);
    data[collection] = items;
    await saveFullData(data);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");
  const body = await request.json();

  // Try local server first
  try {
    const res = await fetch(`${LOCAL_SERVER_URL}/${collection}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(500)
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (err) { /* Silent fail to fallback */ }

  try {
    const data = await getFullData();
    const items = data[collection] || [];
    const index = items.findIndex(i => String(i.id) === String(id));
    if (index === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
    items[index] = { ...items[index], ...body };
    data[collection] = items;
    await saveFullData(data);
    return NextResponse.json(items[index]);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");

  // Try local server first
  try {
    const res = await fetch(`${LOCAL_SERVER_URL}/${collection}/${id}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(500)
    });
    if (res.ok) return NextResponse.json({ message: "Deleted" });
  } catch (err) { /* Silent fail to fallback */ }

  try {
    const data = await getFullData();
    const items = data[collection] || [];
    data[collection] = items.filter(i => String(i.id) !== String(id));
    await saveFullData(data);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");
  const body = await request.json();

  // Try local server first
  try {
    const res = await fetch(`${LOCAL_SERVER_URL}/${collection}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(500)
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (err) { /* Silent fail to fallback */ }

  try {
    const data = await getFullData();
    const items = data[collection] || [];
    const index = items.findIndex(i => String(i.id) === String(id));
    if (index === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
    items[index] = { ...body, id };
    data[collection] = items;
    await saveFullData(data);
    return NextResponse.json(items[index]);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
