export class User {
    name: string
    email: string

    constructor(name: string, email: string) {
        this.name = name
        this.email = email
    }

    toJSON() {
        return {
            name: this.name,
            email: this.email,
        };
    }
}
