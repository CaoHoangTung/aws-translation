# cd ../amztrans-ui
# npm run build
# cd ..
# mkdir ./deployment/resources/frontend
# mv amztrans-ui/build/* ../deployment/resources/frontend
# cd deployment && cdk deploy

cdk deploy --app "python statichost.py" --outputs-file ./infra-output.json