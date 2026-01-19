-- Clean up existing NOTE activities to remove HTML tags and entities
-- This makes old note activities readable in the timeline

UPDATE "CRMActivity"
SET "content" = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE("content", '<[^>]*>', ' ', 'g'), -- Remove HTML tags
              '&nbsp;', ' ', 'g'), -- Replace &nbsp;
            '&amp;', '&', 'g'), -- Decode &amp;
          '&lt;', '<', 'g'), -- Decode &lt;
        '&gt;', '>', 'g'), -- Decode &gt;
      '&quot;', '"', 'g'), -- Decode &quot;
    '\s+', ' ', 'g'), -- Replace multiple spaces with single space
  '^\s+|\s+$', '', 'g') -- Trim leading/trailing spaces
WHERE "type" = 'NOTE'
AND "content" LIKE '%<%'; -- Only update activities that contain HTML tags
