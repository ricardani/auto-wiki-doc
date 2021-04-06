#!/bin/sh
CURRENT_FOLDER=${pwd}
WIKIP="https://${INPUT_ACCESS_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git"

echo "Cloning WIKI Repo..."
git clone $WIKIP ~/wiki-tmp

echo "Cleaning..."
rm -r ~/wiki-tmp/*

echo "Copy Files..."
echo "-> Wiki Folder: ${INPUT_WIKI_FOLDER}"

echo $CURRENT_FOLDER

if [ ! -d "./${INPUT_WIKI_FOLDER}" ]; then
    echo "Specified Wiki Folder Missing"
    exit 1
fi
cp -a ${INPUT_WIKI_FOLDER}/. ~/wiki-tmp

echo "Git Config..."
echo "-> User: ${INPUT_COMMIT_USERNAME}"
echo "-> Email: ${INPUT_COMMIT_EMAIL}"
git config --global user.email "${INPUT_COMMIT_EMAIL}"
git config --global user.name "${INPUT_COMMIT_USERNAME}"

echo "Commit..."
echo "-> Message: ${INPUT_COMMIT_MESSAGE}"
cd ~/wiki-tmp
git add -A
git commit -m "${INPUT_COMMIT_MESSAGE}"
git push $WIKIP

cd $CURRENT_FOLDER

echo "Finished!"