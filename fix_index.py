import io

path = r'C:\Users\DELL\Desktop\help\index.html'

with io.open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a spacer before the logo to push logo/title/desc/spinner to the middle
old = '      <img src="/favicon.svg" alt="" />'
new = '      <div class="spacer" style="flex:1;"></div>\n      <img src="/favicon.svg" alt="" />'
content = content.replace(old, new, 1)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')