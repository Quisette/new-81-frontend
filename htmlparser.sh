slimrb ./index.slim ./foo.html -r slim/include
sed "s/&#39;/\'/g" foo.html > index.html
rm foo.html
