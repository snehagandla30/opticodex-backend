from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import re

app = Flask(__name__)

# ✅ Allow frontend (Vercel) to talk to backend
CORS(app)

codes_db = {}

PYTHON_CMD = "python"


# ---------------- RUN PYTHON ----------------
@app.route("/run_python", methods=["POST"])
def run_python():
    try:
        data = request.get_json()
        code = data.get("code", "")

        if not code.strip():
            return jsonify({"output": "", "error": "Code is empty."})

        safe_imports = [
            "import math\n",
            "import random\n",
            "import statistics\n"
        ]

        safe_code = "".join(safe_imports) + "\n" + code

        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode='w') as temp:
            temp.write(safe_code)
            temp_path = temp.name

        result = subprocess.run(
            [PYTHON_CMD, temp_path],
            capture_output=True,
            text=True,
            timeout=5
        )

        os.remove(temp_path)

        return jsonify({
            "output": result.stdout,
            "error": result.stderr,
            "has_syntax_error": "SyntaxError" in result.stderr or "IndentationError" in result.stderr
        })

    except Exception as e:
        return jsonify({"error": str(e)})


# ---------------- INDENT FIX ----------------
def fix_indentation(code):
    lines = code.splitlines()
    fixed = []
    indent_level = 0

    for line in lines:
        stripped = line.strip()

        if not stripped:
            fixed.append("")
            continue

        if stripped.startswith(("return", "break", "continue")):
            indent_level = max(indent_level - 1, 0)

        fixed.append("    " * indent_level + stripped)

        if stripped.endswith(":"):
            indent_level += 1

    return "\n".join(fixed)


# ---------------- ANALYZE ----------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        code = data.get("code", "")

        issues = []
        suggestions = []
        suggested_code = code
        score = 10

        if not code.strip():
            return jsonify({
                "score": 0,
                "friendly_explanations": ["Your code is empty 😅"],
                "suggestions": ["Try: print('Hello World!')"],
                "suggested_code": None
            })

        # Fix '=' inside if
        if re.search(r'if\s+.*=\s*.*', suggested_code) and "==" not in suggested_code:
            issues.append("Used '=' instead of '==' ❌")
            suggestions.append("Use == for comparison (if x == 5)")
            score -= 2
            suggested_code = re.sub(r'if\s+(.*)\s=\s(.*)', r'if \1 == \2', suggested_code)

        # Missing colon
        lines = suggested_code.splitlines()
        fixed_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith(("if ", "for ", "while ", "def ")) and not stripped.endswith(":"):
                issues.append("Missing ':' at end of statement")
                suggestions.append("Add ':' after if/for/while/def")
                score -= 1
                line = line + ":"
            fixed_lines.append(line)
        suggested_code = "\n".join(fixed_lines)

        # Fix parentheses
        if suggested_code.count("(") > suggested_code.count(")"):
            issues.append("Missing closing parenthesis )")
            suggestions.append("Balance your brackets")
            score -= 2
            suggested_code += ")" * (suggested_code.count("(") - suggested_code.count(")"))

        # Fix indentation
        fixed_indent = fix_indentation(suggested_code)
        if fixed_indent != suggested_code:
            issues.append("Indentation error detected 📐")
            suggestions.append("Use proper indentation (4 spaces)")
            score -= 2
            suggested_code = fixed_indent

        # No print
        if "print(" not in code:
            issues.append("No output visible 📭")
            suggestions.append("Use print() to show output")
            score -= 2

        return jsonify({
            "score": max(0, score),
            "friendly_explanations": issues,
            "suggestions": suggestions,
            "suggested_code": suggested_code if suggested_code != code else None
        })

    except Exception as e:
        return jsonify({"error": str(e)})


# ---------------- SAVE ----------------
@app.route("/save_code", methods=["POST"])
def save_code():
    try:
        data = request.get_json()
        email = data.get("email", "guest")
        title = data.get("title", "Untitled")
        snippet = data.get("codeSnippet", "")
        score = data.get("score", 0)

        if email not in codes_db:
            codes_db[email] = []

        codes_db[email].append({
            "title": title,
            "code": snippet,
            "score": score
        })

        return jsonify({"success": True, "codes": codes_db[email]})

    except:
        return jsonify({"success": False})


# ---------------- GET ----------------
@app.route("/my_codes", methods=["POST"])
def my_codes():
    data = request.get_json()
    email = data.get("email", "guest")
    return jsonify({"codes": codes_db.get(email, [])})


# ---------------- UPDATE ----------------
@app.route("/update_code", methods=["POST"])
def update_code():
    data = request.get_json()
    email = data.get("email")
    index = data.get("index")
    code = data.get("code")
    title = data.get("title")

    if email in codes_db and 0 <= index < len(codes_db[email]):
        codes_db[email][index]["code"] = code
        codes_db[email][index]["title"] = title
        return jsonify({"success": True, "codes": codes_db[email]})

    return jsonify({"success": False})


# ---------------- DELETE ----------------
@app.route("/delete_code", methods=["POST"])
def delete_code():
    data = request.get_json()
    email = data.get("email")
    index = data.get("index")

    if email in codes_db and 0 <= index < len(codes_db[email]):
        codes_db[email].pop(index)
        return jsonify({"success": True, "codes": codes_db[email]})

    return jsonify({"success": False})


# ---------------- ROOT ----------------
@app.route("/", methods=["GET"])
def home():
    return "🚀 Opticodex Backend is running!"


# ---------------- RUN APP (FINAL FIX) ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Backend running on port {port}")
    app.run(host="0.0.0.0", port=port)