from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def _add_column_if_missing(engine: Engine, table_name: str, column_name: str, ddl: str) -> None:
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns(table_name)}
    if column_name in columns:
        return
    with engine.begin() as connection:
        connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {ddl}"))


def sync_runtime_schema(engine: Engine) -> None:
    # Create any new tables that don't exist yet
    from app.db.base import Base
    Base.metadata.create_all(engine)

    _add_column_if_missing(engine, "discount_settings", "default_shipping_fee", "default_shipping_fee FLOAT DEFAULT 30000")
    _add_column_if_missing(engine, "categories", "parent_id", "parent_id INTEGER REFERENCES categories(id)")
    _add_column_if_missing(engine, "products", "variant_options", "variant_options TEXT")

    order_columns = {
        "payment_method": "payment_method VARCHAR(20) DEFAULT 'cod'",
        "payment_status": "payment_status VARCHAR(20) DEFAULT 'pending'",
        "payment_code": "payment_code VARCHAR(50)",
        "paid_at": "paid_at TIMESTAMP",
        "sepay_transaction_id": "sepay_transaction_id VARCHAR(100)",
        "shipping_fee": "shipping_fee FLOAT DEFAULT 30000",
        "shipping_full_name": "shipping_full_name VARCHAR(255)",
        "shipping_phone": "shipping_phone VARCHAR(50)",
        "shipping_address": "shipping_address VARCHAR(255)",
        "shipping_city": "shipping_city VARCHAR(120)",
        "shipping_postal_code": "shipping_postal_code VARCHAR(50)",
        "tracking_number": "tracking_number VARCHAR(100)",
        "discount_code_id": "discount_code_id INTEGER REFERENCES discount_codes(id)",
    }
    for column_name, ddl in order_columns.items():
        _add_column_if_missing(engine, "orders", column_name, ddl)

    order_item_columns = {
        "combo_id": "combo_id INTEGER REFERENCES combos(id)",
        "combo_discount_percent": "combo_discount_percent INTEGER",
    }
    for column_name, ddl in order_item_columns.items():
        _add_column_if_missing(engine, "order_items", column_name, ddl)

    payment_columns = {
        "transaction_id": "transaction_id VARCHAR(255)",
    }
    for column_name, ddl in payment_columns.items():
        _add_column_if_missing(engine, "payments", column_name, ddl)
