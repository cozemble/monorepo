
FUNCTION_DIR=`pwd`
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

npx ts-node --esm $SCRIPT_DIR/rewrite-workspace-deps.ts $FUNCTION_DIR

