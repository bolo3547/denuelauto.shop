from pathlib import Path
p=Path('frontend/pages/PublicWebsite.tsx')
s=p.read_text()
cur=0
for idx,ch in enumerate(s):
    if ch=='{': cur+=1
    elif ch=='}': cur-=1
    if cur<0:
        print('Negative at index',idx,'char',ch)
        break
print('Final brace balance',cur)
# show balance per line
lines=s.splitlines()
cur=0
for i,l in enumerate(lines,1):
    for c in l:
        if c=='{': cur+=1
        elif c=='}': cur-=1
    if cur<0:
        print('Unbalanced negative at line',i)
        break
print('Final balance after line scan',cur)
