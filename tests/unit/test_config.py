"""Pure unit tests for backend.config — no I/O, no fixtures."""

from config import Settings


class TestCorsOriginsList:
    def test_single_origin(self):
        s = Settings(backend_cors_origins="http://localhost:5173")
        assert s.cors_origins_list == ["http://localhost:5173"]

    def test_comma_separated_origins_are_split(self):
        s = Settings(backend_cors_origins="http://a.test,http://b.test")
        assert s.cors_origins_list == ["http://a.test", "http://b.test"]

    def test_whitespace_around_origins_is_stripped(self):
        s = Settings(backend_cors_origins=" http://a.test , http://b.test ")
        assert s.cors_origins_list == ["http://a.test", "http://b.test"]

    def test_empty_entries_are_dropped(self):
        s = Settings(backend_cors_origins="http://a.test,,http://b.test,")
        assert s.cors_origins_list == ["http://a.test", "http://b.test"]

    def test_default_value(self):
        s = Settings()
        assert s.cors_origins_list == ["http://localhost:5173"]
