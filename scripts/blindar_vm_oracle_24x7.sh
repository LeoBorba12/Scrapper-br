#!/bin/bash
# ==============================================================================
# FutStats - Configuração e Blindagem 24/7 da Oracle Cloud VM (Free Tier)
# ==============================================================================
set -e

echo "=== [1/4] Criando e Ativando SWAP de 2GB para evitar OOM (Out of Memory) ==="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap de 2GB criado com sucesso!"
else
    echo "Swapfile já existente."
fi

# Ajustar swappiness para liberar RAM antes de travar
sudo sysctl vm.swappiness=20
echo "vm.swappiness=20" | sudo tee -a /etc/sysctl.conf

echo "=== [2/4] Configurando logs com logrotate ==="
sudo tee /etc/logrotate.d/futstats > /dev/null << 'EOF'
/var/log/futstats_orquestrador*.log {
    daily
    rotate 5
    compress
    missingok
    notifempty
    copytruncate
}
EOF

echo "=== [3/4] Instalando e Habilitando o Serviço Systemd (Auto-Restart) ==="
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CURRENT_USER="$(whoami)"

sed -e "s|/home/ubuntu/Scrapper-br|$APP_DIR|g" \
    -e "s|User=ubuntu|User=$CURRENT_USER|g" \
    "$APP_DIR/scripts/futstats-orquestrador.service" | sudo tee /etc/systemd/system/futstats-orquestrador.service > /dev/null

sudo systemctl daemon-reload
sudo systemctl enable futstats-orquestrador.service
sudo systemctl restart futstats-orquestrador.service

echo "=== [4/4] Verificando Status do Serviço ==="
sudo systemctl status futstats-orquestrador.service --no-pager

echo ""
echo "=========================================================================="
echo "  [OK] VM BLINDADA COM SUCESSO! O FutStats agora roda 24/7 de forma estável."
echo "  Para ver os logs em tempo real: tail -f /var/log/futstats_orquestrador.log"
echo "=========================================================================="
