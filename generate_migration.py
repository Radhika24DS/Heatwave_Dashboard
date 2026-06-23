import os
import shutil
import subprocess

def main() -> None:
    """
    Automates the generation of the initial migration file using a temporary
    sync SQLite environment, then restores the async PostgreSQL configurations.
    """
    env_path = os.path.join("alembic", "env.py")
    backup_path = os.path.join("alembic", "env.py.bak")
    
    print("Backing up async env.py...")
    shutil.copyfile(env_path, backup_path)
    
    sync_env_content = """import os
import sys
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
config.set_main_option("sqlalchemy.url", "sqlite:///temp.db")

def run_migrations_online() -> None:
    connectable = create_engine("sqlite:///temp.db", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    context.configure(
        url="sqlite:///temp.db",
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"}
    )
    with context.begin_transaction():
        context.run_migrations()
else:
    run_migrations_online()
"""
    
    try:
        print("Writing temporary sync SQLite env.py...")
        with open(env_path, "w") as f:
            f.write(sync_env_content)
            
        print("Running alembic revision --autogenerate...")
        # Run alembic using the virtual environment's python/alembic
        alembic_bin = os.path.join("venv", "Scripts", "alembic")
        subprocess.run([alembic_bin, "revision", "--autogenerate", "-m", "Initial schema"], check=True)
        print("Migration generated successfully!")
        
    except Exception as e:
        print(f"Error during migration generation: {e}")
    finally:
        print("Restoring original async env.py...")
        if os.path.exists(backup_path):
            shutil.copyfile(backup_path, env_path)
            os.remove(backup_path)
            
        print("Cleaning up temporary SQLite database...")
        if os.path.exists("temp.db"):
            os.remove("temp.db")
            
        print("Completed.")

if __name__ == "__main__":
    main()
