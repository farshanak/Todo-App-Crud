.PHONY: test test-unit test-integration test-tia coverage

test:
	pytest

test-unit:
	pytest tests/unit

test-integration:
	pytest tests/integration

coverage:
	pytest --cov=backend --cov-report=term-missing

# Test Impact Analysis: only run tests affected by changes locally.
# CI Safety Latch: when CI=true, run the full suite — no shortcuts.
test-tia:
	@if [ "$$CI" = "true" ]; then \
		echo "CI Safety Latch: running ALL tests"; \
		pytest; \
	else \
		echo "TIA: running affected tests only (pytest-testmon)"; \
		pytest --testmon; \
	fi
