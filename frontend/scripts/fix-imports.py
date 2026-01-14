#!/usr/bin/env python3
"""
Script to fix React and Router import warnings from ESLint.
Converts React.useState -> useState with proper imports
Converts Router default import -> useRouter (note: requires manual code changes)
"""

import re
import os
import sys
from pathlib import Path
from typing import Set, List

def fix_react_imports_in_file(filepath: str) -> bool:
    """Fix React member access to use named imports instead."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Find React import statement
    react_import_pattern = r'import\s+React(?:\s*,\s*\{([^}]*)\})?\s+from\s+["\']react["\']\s*;?'
    match = re.search(react_import_pattern, content)

    if not match:
        return False

    # Get existing named imports
    existing_imports_str = match.group(1) or ''
    existing_imports = [imp.strip() for imp in existing_imports_str.split(',') if imp.strip()]

    # Find all React.member patterns in the file
    react_members_pattern = r'React\.(\w+)'
    react_members = set(re.findall(react_members_pattern, content))

    if not react_members:
        return False

    # Combine with existing imports (remove duplicates)
    all_imports = sorted(set(existing_imports + list(react_members)))

    # Build new import statement
    new_import = f'import React, {{ {", ".join(all_imports)} }} from "react";'
    content = re.sub(react_import_pattern, new_import, content)

    # Replace React.member with member
    for member in react_members:
        content = re.sub(rf'React\.{member}\b', member, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False


def find_files_with_issues() -> List[str]:
    """Find all TypeScript/JavaScript files that might have issues."""
    frontend_dir = Path(__file__).parent.parent
    extensions = ['.tsx', '.ts', '.jsx', '.js']
    exclude_dirs = {'node_modules', '.next', 'coverage', 'dist', 'build', 'devlink'}

    files = []
    for ext in extensions:
        for filepath in frontend_dir.rglob(f'*{ext}'):
            # Skip excluded directories
            if any(excluded in filepath.parts for excluded in exclude_dirs):
                continue
            files.append(str(filepath))

    return files


def main():
    print("🔍 Finding files to fix...")
    files = find_files_with_issues()
    print(f"Found {len(files)} files to check")

    fixed_count = 0
    for filepath in files:
        try:
            if fix_react_imports_in_file(filepath):
                print(f"✅ Fixed: {filepath}")
                fixed_count += 1
        except Exception as e:
            print(f"❌ Error processing {filepath}: {e}", file=sys.stderr)

    print(f"\n✨ Fixed {fixed_count} files")
    print("\nNote: Router imports need manual review - they've been left as-is")
    print("PropTypes warnings are cosmetic and have been left as-is")
    print("\nRun 'yarn lint' to verify the fixes")


if __name__ == '__main__':
    main()

