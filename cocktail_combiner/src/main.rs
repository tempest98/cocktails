use std::env;
use std::fs;
use std::io;
use std::process;
use serde_json::Value;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: {} <directory>", args[0]);
        process::exit(1);
    }
    
    let dir_path = &args[1];
    let recipes = match collect_recipes(dir_path) {
        Ok(recipes) => recipes,
        Err(err) => {
            eprintln!("Error: {}", err);
            process::exit(1);
        }
    };
    
    match serde_json::to_string_pretty(&recipes) {
        Ok(json) => println!("{}", json),
        Err(err) => {
            eprintln!("Error serializing JSON: {}", err);
            process::exit(1);
        }
    }
}

fn collect_recipes(dir_path: &str) -> Result<Vec<Value>, io::Error> {
    let mut recipes = Vec::new();
    
    let entries = fs::read_dir(dir_path)?;
    
    for entry in entries {
        let entry = entry?;
        let path = entry.path();
        
        if path.is_dir() {
            let data_json_path = path.join("data.json");
            if data_json_path.exists() {
                match fs::read_to_string(&data_json_path) {
                    Ok(contents) => {
                        match serde_json::from_str::<Value>(&contents) {
                            Ok(json) => recipes.push(json),
                            Err(err) => eprintln!("Error parsing JSON from {}: {}", 
                                data_json_path.display(), err),
                        }
                    },
                    Err(err) => eprintln!("Error reading {}: {}", data_json_path.display(), err),
                }
            }
        }
    }
    
    Ok(recipes)
}
