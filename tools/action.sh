#!/bin/sh

WIKIP="https://${INPUT_ACCESS_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git"

echo "Cloning WIKI Repo..."
git clone $WIKIP ~/wiki

echo "Cleaning..."
rm -r ~/wiki/*

echo "Copy Files..."
echo "-> Wiki Folder: ${INPUT_WIKI_FOLDER}"
ls -l

if [ ! -d "/github/workspace/${INPUT_WIKI_FOLDER}" ]; then
    echo "Specified Wiki Folder Missing"
    exit 1
fi
cp -a ${INPUT_WIKI_FOLDER}/. ~/wiki

echo "Git Config..."
echo "-> User: ${INPUT_COMMIT_USERNAME}"
echo "-> Email: ${INPUT_COMMIT_EMAIL}"
git config --global user.email "${INPUT_COMMIT_EMAIL}"
git config --global user.name "${INPUT_COMMIT_USERNAME}"

echo "Commit..."
echo "-> Message: ${INPUT_COMMIT_MESSAGE}"
cd ~/wiki
git add -A
git commit -m "${INPUT_COMMIT_MESSAGE}"
git push $WIKIP

echo "Finished!"