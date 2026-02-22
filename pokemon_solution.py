# candidate_solution.py
import sqlite3
import os
from fastapi import FastAPI, HTTPException
from typing import List, Optional
import uvicorn
import httpx

# --- Constants ---
DB_NAME = "pokemon_assessment.db"


# --- Database Connection ---
def connect_db() -> Optional[sqlite3.Connection]:
    """
    Task 1: Connect to the SQLite database.
    Implement the connection logic and return the connection object.
    Return None if connection fails.
    """
    if not os.path.exists(DB_NAME):
        print(f"Error: Database file '{DB_NAME}' not found.")
        return None

    connection = None
    try:
        connection = sqlite3.connect(DB_NAME)
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None

    return connection


# --- Data Cleaning ---
def clean_database(conn: sqlite3.Connection):
    """
    Task 2: Clean up the database using the provided connection object.
    Implement logic to:
    - Remove duplicate entries in tables (pokemon, types, abilities, trainers).
      Choose a consistent strategy (e.g., keep the first encountered/lowest ID).
    - Correct known misspellings (e.g., 'Pikuchu' -> 'Pikachu', 'gras' -> 'Grass', etc.).
    - Standardize casing (e.g., 'fire' -> 'Fire' or all lowercase for names/types/abilities).
    """
    if not conn:
        print("Error: Invalid database connection provided for cleaning.")
        return

    cursor = conn.cursor()
    print("Starting database cleaning...")  

    try:
        # Get list of tables to clean
        conn.execute("""
            SELECT name
            FROM sqlite_master
            WHERE type='table' 
            AND name NOT LIKE 'sqlite_%';
        """)

        tables = cursor.fetchall()

        # Remove duplicates
        for table in tables:
            table_name = table[0]
            print("Cleaning table:", table_name)

            cursor.execute(f"""
                DELETE FROM {table_name}
                WHERE rowid NOT IN (
                    SELECT MIN(rowid)
                    FROM {table_name}
                    GROUP BY name
                );
            """)

        # Correct known misspellings, remove redundant data, and standardize casing
        redundant_placeholders = ['---', '???', '']
        corrections = {
            'Pikuchu': 'Pikachu',
            'Charmanderr': 'Charmander',
            'Bulbasuar': 'Bulbasaur',
            'Poision': 'Poison',
            'gras': 'Grass',
        }

        for table in tables:
            table_name = table[0]
            print("Correcting misspellings and standardizing casing for table:", table_name)

            # Remove redundant placeholders
            for placeholder in redundant_placeholders:
                cursor.execute(f"""
                    DELETE FROM {table_name}
                    WHERE name = '{placeholder}';
                """)

            # Correct misspellings
            for wrong, correct in corrections.items():
                cursor.execute(f"""
                    UPDATE {table_name}
                    SET name = '{correct}'
                    WHERE name = '{wrong}';
                """)

            # Standardize casing
            cursor.execute(f"""
                UPDATE {table_name}
                SET name =
                    UPPER(SUBSTR(name, 1, 1)) ||
                    LOWER(SUBSTR(name, 2));
            """)

        conn.commit()
        print("Database cleaning finished and changes committed.")

    except sqlite3.Error as e:
        print(f"An error occurred during database cleaning: {e}")
        conn.rollback()


# --- FastAPI Application ---
def create_fastapi_app() -> FastAPI:
    """ 
    FastAPI application instance.
    Define the FastAPI app and include all the required endpoints below.
    """
    print("Creating FastAPI app and defining endpoints...")
    app = FastAPI(title="Pokemon Assessment API")

    # --- GET Endpoints ---


    # Root endpoint
    @app.get("/")
    def read_root():
        """
        Task 3: Basic root response message
        Return a simple JSON response object that contains a `message` key with any corresponding value.
        """
        return {"message": "Welcome to the Pokemon Assessment API!"}


    # Get pokemon by ability
    @app.get("/pokemon/ability/{ability_name}", response_model=List[str])
    def get_pokemon_by_ability(ability_name: str):
        """
        Task 4: Retrieve all Pokémon names with a specific ability.
        Query the cleaned database. Handle cases where the ability doesn't exist.
        """
        conn = connect_db()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed.")

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT DISTINCT p.name
                FROM pokemon p
                JOIN trainer_pokemon_abilities tpa ON p.id = tpa.pokemon_id
                JOIN abilities a ON tpa.ability_id = a.id
                WHERE a.name = ?;
            """, (ability_name,))

            results = cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database query error: {e}")
            raise HTTPException(status_code=500, detail="An error occurred while querying the database.")
        finally:
            conn.close()

        if not results:
            raise HTTPException(status_code=404, detail=f"No Pokémon found with ability '{ability_name}'.")

        return [row[0] for row in results]


    # Get pokemon by type
    @app.get("/pokemon/type/{type_name}", response_model=List[str])
    def get_pokemon_by_type(type_name: str):
        """
        Task 5: Retrieve all Pokémon names of a specific type (considers type1 and type2).
        Query the cleaned database. Handle cases where the type doesn't exist.
        """
        conn = connect_db()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed.")

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT DISTINCT p.name
                FROM pokemon p
                JOIN types t1 ON p.type1_id = t1.id
                LEFT JOIN types t2 ON p.type2_id = t2.id
                WHERE t1.name = ? OR t2.name = ?;
            """, (type_name, type_name))

            results = cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database query error: {e}")
            raise HTTPException(status_code=500, detail="An error occurred while querying the database.")
        finally:
            conn.close()

        if not results:
            raise HTTPException(status_code=404, detail=f"No Pokémon found with type '{type_name}'.")

        return [row[0] for row in results]


    # Get trainers by pokemon
    @app.get("/trainers/pokemon/{pokemon_name}", response_model=List[str])
    def get_trainers_by_pokemon(pokemon_name: str):
        """
        Task 6: Retrieve all trainer names who have a specific Pokémon.
        Query the cleaned database. Handle cases where the Pokémon doesn't exist or has no trainer.
        """
        conn = connect_db()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed.")

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT DISTINCT t.name
                FROM trainers t
                JOIN trainer_pokemon_abilities tpa ON t.id = tpa.trainer_id
                JOIN pokemon p ON tpa.pokemon_id = p.id
                WHERE p.name = ?;
            """, (pokemon_name,))

            results = cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database query error: {e}")
            raise HTTPException(status_code=500, detail="An error occurred while querying the database.")
        finally:
            conn.close()

        if not results:
            raise HTTPException(status_code=404, detail=f"No Pokémon found where trainer has '{pokemon_name}'.")

        return [row[0] for row in results]


    # Get abilities by pokemon
    @app.get("/abilities/pokemon/{pokemon_name}", response_model=List[str])
    def get_abilities_by_pokemon(pokemon_name: str):
        """
        Task 7: Retrieve all ability names of a specific Pokémon.
        Query the cleaned database. Handle cases where the Pokémon doesn't exist.
        """
        conn = connect_db()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed.")

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT DISTINCT a.name
                FROM pokemon p
                JOIN trainer_pokemon_abilities tpa ON p.id = tpa.pokemon_id
                JOIN abilities a ON tpa.ability_id = a.id
                WHERE p.name = ?;
            """, (pokemon_name,))

            results = cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database query error: {e}")
            raise HTTPException(status_code=500, detail="An error occurred while querying the database.")
        finally:
            conn.close()

        if not results:
            raise HTTPException(status_code=404, detail=f"No abilities found for Pokémon '{pokemon_name}'.")

        return [row[0] for row in results]


    # Post endpoint to add a new pokemon
    @app.post("/pokemon/Add/{pokemon_name}", response_model=int)
    def add_pokemon(pokemon_name: str):
        """
        Fetches a Pokémon from PokeAPI and inserts it into trainer_pokemon_abilities
        with all relevant FK connections. Returns the new record's database ID.
        """

        # 1. Fetch data from PokeAPI
        API_URL = "https://pokeapi.co/api/v2/pokemon/"
        api_response = httpx.get(f"{API_URL}{pokemon_name.lower()}")

        if api_response.status_code != 200:
            raise HTTPException(status_code=404, detail=f"Pokémon '{pokemon_name}' not found in PokeAPI.")

        api_data = api_response.json()

        poke_name = api_data['name'].capitalize()
        pokemon_types = api_data['types']
        pokemon_abilities = api_data['abilities']

        type1_name = pokemon_types[0]['type']['name'].capitalize()
        type2_name = pokemon_types[1]['type']['name'].capitalize() if len(pokemon_types) > 1 else None
        ability_name = pokemon_abilities[0]["ability"]["name"].capitalize()

        # 2. Insert data into the database
        conn = connect_db()

        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed.")

        try:
            cursor = conn.cursor()

            # Get or insert type1
            cursor.execute("SELECT id FROM types WHERE name = ?", (type1_name,))
            row = cursor.fetchone()
            type1_id = row[0] if row else cursor.execute(
                "INSERT INTO types (name) VALUES (?)", (type1_name,)
            ).lastrowid

            # Get or insert type2
            type2_id = None
            if type2_name:
                cursor.execute("SELECT id FROM types WHERE name = ?", (type2_name,))
                row = cursor.fetchone()
                type2_id = row[0] if row else cursor.execute(
                    "INSERT INTO types (name) VALUES (?)", (type2_name,)
                ).lastrowid

            # Get or insert pokemon
            cursor.execute("SELECT id FROM pokemon WHERE name = ?", (poke_name,))
            row = cursor.fetchone()
            if row:
                pokemon_id = row[0]
            else:
                cursor.execute(
                    "INSERT INTO pokemon (name, type1_id, type2_id) VALUES (?, ?, ?)",
                    (poke_name, type1_id, type2_id)
                )
                pokemon_id = cursor.lastrowid

            # Get or insert ability
            cursor.execute("SELECT id FROM abilities WHERE name = ?", (ability_name,))
            row = cursor.fetchone()
            if row:
                ability_id = row[0]
            else:
                cursor.execute("INSERT INTO abilities (name) VALUES (?)", (ability_name,))
                ability_id = cursor.lastrowid

            # Get first available trainer as default
            cursor.execute("SELECT id FROM trainers LIMIT 1")
            trainer_row = cursor.fetchone()
            if not trainer_row:
                raise HTTPException(status_code=500, detail="No trainers found in the database.")
            trainer_id = trainer_row[0]

            # Insert into trainer_pokemon_abilities
            cursor.execute("""
                INSERT INTO trainer_pokemon_abilities (pokemon_id, trainer_id, ability_id)
                VALUES (?, ?, ?)
            """, (pokemon_id, trainer_id, ability_id))

            new_id = cursor.lastrowid
            conn.commit()
            return new_id

        except sqlite3.Error as e:
            conn.rollback()
            print(f"Database error: {e}")
            raise HTTPException(status_code=500, detail="An error occurred while writing to the database.")
        finally:
            conn.close()

    print("FastAPI app created successfully.")
    return app


# --- Main execution / Uvicorn setup (Optional - for candidate to run locally) ---
if __name__ == "__main__":
    # Ensure data is cleaned before running the app for testing
    temp_conn = connect_db()
    if temp_conn:
        clean_database(temp_conn)
        temp_conn.close()

    app_instance = create_fastapi_app()
    uvicorn.run(app_instance, host="127.0.0.1", port=8000)
