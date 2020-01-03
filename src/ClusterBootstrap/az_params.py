default_az_parameters = {
    "azure_cluster" : { 
        "subscription": "Bing DLTS",
        "infra_node_num": 1, 
        "worker_node_num": 2, 
        "nfs_node_num": 1,
        "azure_location": "westus2",
        "infra_vm_size" : "Standard_D1_v2",
        "worker_vm_size": "Standard_NC6",
        "nfs_vm_size": "Standard_D1_v2",
        "vm_image" : "Canonical:UbuntuServer:18.04-LTS:18.04.201907221",
        "vm_local_storage_sku" : "Premium_LRS",
        "infra_local_storage_sz" : 1023,
        "worker_local_storage_sz" : 1023,
        "nfs_data_disk_sku" : "Premium_LRS",
        "nfs_data_disk_sz" : 1023,
        "nfs_data_disk_num": 1,
        "nfs_data_disk_path": '/data',
        "nfs_vm": [],
    },
    "cloud_config": {
        "nfs_ssh" : {
            "port": 22,
        },
        "nfs_share": {
            "source_ips": ["192.168.0.0/16"],
        }, 
        # "samba_range" : "192.168.0.0/16"
    },
    "nfs_mnt_setup": [
        {
        "mnt_point": {
            "rootshare":{
                "curphysicalmountpoint":"/mntdlws/nfsshare","filesharename":"/data/nfsshare",
                "mountpoints":""}
            }
        }
    ],
}
