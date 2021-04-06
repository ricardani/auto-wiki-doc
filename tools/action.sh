#!/bin/sh
MAIN_FOLDER=$(pwd)
WIKIP="https://${ACCESS_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git"

echo "Cloning WIKI Repo..."
git clone $WIKIP ~/wiki-tmp

echo "Cleaning..."
rm -r ~/wiki-tmp/*

echo "Copy Files..."
echo "-> Wiki Folder: ${WIKI_FOLDER}"

if [ ! -d "./${WIKI_FOLDER}" ]; then
    echo "Specified Wiki Folder Missing"
    exit 1
fi
cp -a ${WIKI_FOLDER}/. ~/wiki-tmp

echo "Git Config..."
echo "-> User: ${COMMIT_USERNAME}"
echo "-> Email: ${COMMIT_EMAIL}"
echo "Commit..."
echo "-> Message: ${COMMIT_MESSAGE}"
cd ~/wiki-tmp
git add -A
git -c user.name="${COMMIT_USERNAME}" -c user.email="${COMMIT_EMAIL}" commit -m "${COMMIT_MESSAGE}"
git push $WIKIP

echo "Moving to the main folder..."
cd $MAIN_FOLDER

echo "Finished!"