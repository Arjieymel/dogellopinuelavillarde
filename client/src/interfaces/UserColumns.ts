export type UserColumns = {
    user_id: number;
    profile_picture?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix_name?: string;
    gender: {
        gender_id: number;
        gender: string;
        is_deleted?: boolean;
        created_at?: string;
        updated_at?: string;
    };
    birth_date: string;
    age: string | number;
    username: string;
    password?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
};

