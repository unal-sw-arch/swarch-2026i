import time
import requests

ACTIVE_HEALTH_URL = "http://ecommerce_auth_service:8001/health"
COLD_ACTIVATE_URL = "http://ecommerce_auth_service_cold:8002/activate"
CHECK_INTERVAL = 3
MAX_FAILURES = 3

def alertar_al_respaldo():
    print("[COORDINATOR] Active service down. Triggering failover...")
    try:
        response = requests.post(COLD_ACTIVATE_URL, timeout=3)
        if response.status_code == 200:
            print("[COORDINATOR] Spare instance activated successfully.")
        else:
            print(f"[COORDINATOR] Spare activation failed with status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[COORDINATOR] Critical error connecting to spare instance: {e}")

def monitorear():
    fallos_consecutivos = 0
    print("[COORDINATOR] Monitoring active service on port 8001...")
    
    while True:
        try:
            response = requests.get(ACTIVE_HEALTH_URL, timeout=2)
            if response.status_code == 200:
                fallos_consecutivos = 0
            else:
                fallos_consecutivos += 1
        except requests.exceptions.RequestException:
            fallos_consecutivos += 1
            print("[COORDINATOR] Active service unreachable.")
            
        if fallos_consecutivos >= MAX_FAILURES:
            alertar_al_respaldo()
            break
            
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    time.sleep(15) 
    monitorear()