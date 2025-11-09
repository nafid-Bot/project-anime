// appwrite.js
import { Client, Account, Query, TablesDB } from "appwrite";

const PROJECT_ID  = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID    = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject(PROJECT_ID);

export const account  = new Account(client);
export const tablesDB = new TablesDB(client);

// stable <= 36-char id from search term
function idFromTerm(term) {
    return (
        term.trim().toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-_]/g, "")
            .slice(0, 36) || "term"
    );
}

const cleanIntOrNull = (v) => {
    const n = Number(v);
    return Number.isInteger(n) ? n : null;
};
const cleanStrOrNull = (v) =>
    typeof v === "string" && v.length ? v : null;

export async function recordSearch({ term, poster_url, movie_id }) {
    const q = (term ?? "").trim();
    if (!q) return;

    // 1) Find by searchTerm
    const list = await tablesDB.listRows(DATABASE_ID, TABLE_ID, [
        Query.equal("searchTerm", [q]),
        Query.limit(1),
    ]);
    const rows = list?.rows ?? [];

    if (rows.length > 0) {
        // 2) exists → increment count
        const row = rows[0];
        const newCount = (Number.isInteger(row.count) ? row.count : 0) + 1;

        const updateData = { count: newCount };
        const poster = cleanStrOrNull(poster_url);
        const mid = cleanIntOrNull(movie_id);
        if (poster !== null) updateData.poster_url = poster;
        if (mid !== null) updateData.movie_id = mid;

        return await tablesDB.updateRow(DATABASE_ID, TABLE_ID, row.$id, updateData);
    }

    // 3) not found → create with REQUIRED rowId + data
    const payload = {
        searchTerm: q,
        count: 1,
    };
    const poster = cleanStrOrNull(poster_url);
    const mid = cleanIntOrNull(movie_id);
    if (poster !== null) payload.poster_url = poster;
    if (mid !== null) payload.movie_id = mid;

    const rowId = idFromTerm(q);
    // Removed console.log to prevent exposing data in production

    try {
        // ✅ your SDK expects rowId THEN data
        return await tablesDB.createRow(DATABASE_ID, TABLE_ID, rowId, payload);
    } catch (e1) {
        // If rowId collides (rare) or signature mismatch, try object form
        // Removed console.warn to prevent exposing error details in production
        return await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId,            // required in your SDK
            data: payload,    // required
        });
    }
}

// **
// * Return top N anime rows by count (default 5).
// * Columns: searchTerm, count, poster_url, movie_id
// */
export async function getTrendingAnime(limit = 5) {
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 5)); // clamp

    try {
        const res = await tablesDB.listRows(
            DATABASE_ID,
            TABLE_ID,
            [Query.orderDesc("count"), Query.limit(safeLimit)]
        );

        const rows = res?.rows ?? [];

        // Fallback sort in case the backend ignores order for any reason
        rows.sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0));

        // Normalize output
        return rows.map((r) => ({
            id: r.$id,
            searchTerm: r.searchTerm,
            count: Number(r.count) || 0,
            poster_url: typeof r.poster_url === "string" ? r.poster_url : null,
            movie_id: Number.isInteger(r.movie_id) ? r.movie_id : null,
        }));
    } catch (err) {
        // Log error internally without exposing details to console
        if (import.meta.env.DEV) {
            console.error('getTrendingAnime error:', err);
        }
        throw err;
    }
}