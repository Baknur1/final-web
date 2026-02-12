const fs = require('fs');
const path = require('path');

class BaseRepository {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.basePath = path.join(__dirname, 'data');
        this.filePath = path.join(this.basePath, `${collectionName}.json`);
        this.ensureDirectory();
        this.ensureFile();
    }

    ensureDirectory() {
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }

    ensureFile() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
        }
    }

    findAll() {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(data);
    }

    findById(id) {
        const data = this.findAll();
        return data.find(item => item.id === id);
    }

    find(query) {
        const data = this.findAll();
        return data.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    findOne(query) {
        const data = this.findAll();
        return data.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    save(item) {
        const data = this.findAll();
        if (item.id) {
            const index = data.findIndex(i => i.id === item.id);
            if (index !== -1) {
                data[index] = { ...data[index], ...item };
            } else {
                data.push(item);
            }
        } else {
            item.id = Date.now().toString(); // Basic ID generation
            data.push(item);
        }
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
        return item;
    }

    delete(id) {
        const data = this.findAll();
        const filtered = data.filter(item => item.id !== id);
        fs.writeFileSync(this.filePath, JSON.stringify(filtered, null, 2));
        return true;
    }
}

module.exports = BaseRepository;
