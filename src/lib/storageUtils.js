// storageUtils.js

export const saveDataToFile = (data, filename = 'data.json') => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  export const prepareDataForSave = (save_data) => {
    console.log(save_data);
    const data = {
      xBlocks: save_data.xBlocks,
      yBlocks: save_data.yBlocks,
      blockSize: save_data.blockSize,
      heights: save_data.heights,
      colorDetails: save_data.colorDetails
    };  
    return data;
  };

  export const loadDataFromFile = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target.result;
      const data = JSON.parse(json);
      callback(data);
    };
    reader.readAsText(file);
  };
  