const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spacexdata.com/v2/';
    }

    async getAllLaunches() {
        const response = await this.get('launches');
        return Array.isArray(response)
            ? response.map(l => this.launchReducer(l))
            : [];
    }

    async getLaunchById({ launchId }) {
        const response = await this.get('launches', { flight_number: launchId });
        return this.launchReducer(response[0]);
    }

    getLaunchByIds({ launchIds }) {
        return Promise.all(
            launchIds.map(l => this.getLaunchById({ l })),
        );
    }

    launchReducer(launch) {
        return {
            id: launch.flight_number || 0,
            cursor: `${launch.launch_date_unix}`,
            site: launch.launch_site && launch.launch_site.site_name,
            mission: {
                name: launch.mission_name,
                missionPatchSmall: launch.links.mission_patch_small,
                missionPatchLarge: launch.links.mission_patch,
            },
            rocket: {
                id: launch.rocket.rocket_id,
                name: launch.rocket.rocket_name,
                type: launch.rocket.rocket_type,
            },
        }
    }
}

module.exports = LaunchAPI;