#!/bin/sh
MAIN_FOLDER=$(pwd)
WIKIP="https://${INPUT_ACCESS_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git"

echo "Cloning WIKI Repo..."
git clone $WIKIP ~/wiki-tmp

echo "Cleaning..."
rm -r ~/wiki-tmp/*

echo "Copy Files..."
echo "-> Wiki Folder: ${INPUT_WIKI_FOLDER}"

if [ ! -d "./${INPUT_WIKI_FOLDER}" ]; then
    echo "Specified Wiki Folder Missing"
    exit 1
fi
cp -a ${INPUT_WIKI_FOLDER}/. ~/wiki-tmp

echo "Git Config..."
echo "-> User: ${INPUT_COMMIT_USERNAME}"
echo "-> Email: ${INPUT_COMMIT_EMAIL}"
echo "Commit..."
echo "-> Message: ${INPUT_COMMIT_MESSAGE}"
cd ~/wiki-tmp
git add -A
git -c user.name="${INPUT_COMMIT_USERNAME}" -c user.email="${INPUT_COMMIT_EMAIL}" commit -m "${INPUT_COMMIT_MESSAGE}"
git push $WIKIP

echo "Moving to the main folder..."
cd $MAIN_FOLDER

echo "Finished!"