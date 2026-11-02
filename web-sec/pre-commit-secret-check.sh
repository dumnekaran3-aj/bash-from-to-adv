#!/bin/bash




if git diff --cached | grep -qniE "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][a-zA-Z0-9_\-]{10,}['\"]"; then


    echo "blocked: Potential secret detected in staged changes!"
  
  exit 1


else
    echo "No secrets detected. Proceeding with commit."


    exit 0
fi
