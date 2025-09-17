
SELECT id, filename, url, uploaded_at
FROM images
WHERE uploaded_at >= NOW() - INTERVAL '2 days'
ORDER BY uploaded_at DESC;
