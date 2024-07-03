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
  
  export const prepareDataForSave = (heights, colors) => {
    const data = {
      heights,
      colors: []
    };
  
    for (let i = 0; i < colors.length; i += 3) {
      data.colors.push([colors[i] * 255, colors[i + 1] * 255, colors[i + 2] * 255]);
    }
  
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
  