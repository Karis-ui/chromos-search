set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🧪 CHRONOS SEARCH - RUNNING TESTS  ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo -e "${RED}❌ Virtual environment not found. Run setup.sh first.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔍 Checking test database...${NC}"
PGPASSWORD=chronos_pass psql -h localhost -U chronos_user -d chronos_test -c "SELECT 1" &> /dev/null || {
    echo -e "${YELLOW}📦 Creating test database...${NC}"
    PGPASSWORD=chronos_pass createdb -h localhost -U chronos_user chronos_test
}

echo -e "\n${YELLOW}📋 Running test database migrations...${NC}"
export DATABASE_URL=postgresql+asyncpg://chronos_user:chronos_pass@localhost:5432/chronos_test
alembic -c migrations/alembic.ini upgrade head

echo -e "\n${YELLOW}🧪 Running tests...${NC}"

if [ "$1" == "--coverage" ]; then
    echo -e "${YELLOW}📊 Running tests with coverage report...${NC}"
    pytest -v --cov=app --cov-report=html --cov-report=term
    echo -e "\n${GREEN}📊 Coverage report generated in htmlcov/index.html${NC}"
elif [ "$1" == "--unit" ]; then
    echo -e "${YELLOW}📊 Running unit tests only...${NC}"
    pytest -m unit -v
elif [ "$1" == "--integration" ]; then
    echo -e "${YELLOW}📊 Running integration tests only...${NC}"
    pytest -m integration -v
elif [ "$1" == "--slow" ]; then
    echo -e "${YELLOW}📊 Running slow tests...${NC}"
    pytest -m slow -v
else
    pytest -v --tb=short
fi

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
else
    echo -e "\n${RED}❌ Some tests failed. Check the output above.${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
exit $TEST_EXIT_CODE