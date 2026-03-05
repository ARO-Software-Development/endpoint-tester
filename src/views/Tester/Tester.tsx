import { useTabs, useHistory, useRequest } from '../../hooks';
import './Tester.css'

export default function Tester() {
    const tabs = useTabs();
    const history = useHistory();
    const request = useRequest();
    
    return (
        <div>
            <h1>Tester</h1>
            <p>This is a test page.</p>
        </div>
    )
}