package com.yourstore.online_store_api.admin.product;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Small CSV reader for catalog import (quoted fields, UTF-8 BOM).
 */
final class CatalogCsv {

    private CatalogCsv() {}

    static List<Map<String, String>> parse(String raw) {
        String text = raw == null ? "" : raw;
        if (!text.isEmpty() && text.charAt(0) == '\uFEFF') {
            text = text.substring(1);
        }
        List<String> lines = splitLines(text);
        if (lines.isEmpty()) {
            return List.of();
        }
        List<String> headers = parseRow(lines.get(0)).stream()
                .map(h -> h.trim().toLowerCase(Locale.ROOT))
                .toList();
        List<Map<String, String>> rows = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            if (line.isEmpty()) {
                continue;
            }
            List<String> cells = parseRow(line);
            Map<String, String> row = new LinkedHashMap<>();
            for (int c = 0; c < headers.size(); c++) {
                row.put(headers.get(c), c < cells.size() ? cells.get(c).trim() : "");
            }
            rows.add(row);
        }
        return rows;
    }

    static String cell(Map<String, String> row, String... keys) {
        for (String key : keys) {
            String value = row.get(key.toLowerCase(Locale.ROOT));
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    static List<String> splitList(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        List<String> items = new ArrayList<>();
        for (String part : value.split("[,;]")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                items.add(trimmed);
            }
        }
        return items;
    }

    static String basename(String path) {
        if (path == null || path.isBlank()) {
            return "";
        }
        String normalized = path.replace('\\', '/').trim();
        int slash = normalized.lastIndexOf('/');
        return slash >= 0 ? normalized.substring(slash + 1) : normalized;
    }

    private static List<String> splitLines(String text) {
        List<String> lines = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch == '"') {
                inQuotes = !inQuotes;
                current.append(ch);
            } else if ((ch == '\n' || ch == '\r') && !inQuotes) {
                if (ch == '\r' && i + 1 < text.length() && text.charAt(i + 1) == '\n') {
                    i++;
                }
                lines.add(current.toString());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        if (!current.isEmpty()) {
            lines.add(current.toString());
        }
        return lines;
    }

    static List<String> parseRow(String line) {
        List<String> cells = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (inQuotes) {
                if (ch == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        current.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current.append(ch);
                }
            } else if (ch == '"') {
                inQuotes = true;
            } else if (ch == ',') {
                cells.add(current.toString());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        cells.add(current.toString());
        return cells;
    }
}
